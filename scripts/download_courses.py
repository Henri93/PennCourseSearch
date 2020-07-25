import re 
import requests
from bs4 import BeautifulSoup
from csv import DictReader, DictWriter
import gspread
import json
from oauth2client.service_account import ServiceAccountCredentials

def get_course_categories():
    """Scraps all categories of courses from Upenn's Course Catalog"""

    course_categories = []
    url = 'https://catalog.upenn.edu/courses/index.html'
    html = requests.get(url)
    soup = BeautifulSoup(html.text, "html.parser")
    sitemap = soup.find("div", {"class": "az_sitemap"})
    
    for letter in sitemap.findChildren("ul" , recursive=False):
        for course_abr in letter.find_all('li'):
            for course_link in course_abr.find_all('a', href=True):
                course_categories.append(course_link['href'])
        
    return course_categories

def populate_courses_in_categories(course_categories, courses):
    """Scraps a course category webpage and adds all courses found to a list

    Keyword arguments:
    course_categories -- the relative urls of all course categories 
    courses -- a list where the courses maps are added to
    """
    for category in course_categories:
        
        url = f'https://catalog.upenn.edu{category}index.html'
        html = requests.get(url)
        soup = BeautifulSoup(html.text, "html.parser")

        category_title = soup.find("h1", {"class" : "page-title"}).text.split('(')[0]
        category_title = category_title.replace(u'\xa0', u' ')
        print(category_title)

        course_list = soup.find("div", {"class" : "sc_sccoursedescs"})
        
        if course_list is None:
            print(f'No courses for {category}')
            continue

        for course_block in course_list.find_all("div", {"class" : "courseblock"}):
            title = course_block.find("p", {"class" : "courseblocktitle"}).text
            title = title.replace(u'\xa0', u' ')

            description_items = []
            for course_description_extra in course_block.find_all("p", {"class" : "courseblockextra"}):
                description_item = course_description_extra.text.replace(u'\xa0', u' ')
                description_items.append(description_item)

            code, name = title.split("  ", 1)
            code = ''.join(code.split())
            code_info = re.findall(r'(\w+?)(\d+)', code)[0]
            
            course = {}
            course["title"] = name
            course["prefix"] = code_info[0]
            course["number"] = code_info[1]
            course["description"] = json.dumps(description_items)
            course["prefixTitle"] = category_title
            courses[code] = course
        

def create_course_csv(courses):
    """Creates a csv file from a list of courses

    Keyword arguments:
    courses -- a list of course mappings
    """
    csv_columns = ['Prefix','Number','Title','Category','Description','Comments']
    csv_file = "courses.csv"

    try:
        with open(csv_file, 'w') as csvfile:
            writer = DictWriter(csvfile, fieldnames=csv_columns)
            writer.writeheader()
            for course_code, course_info in courses.items():
                data = {}
                data['Prefix'] = (course_info["prefix"])
                data['Number'] = (course_info["number"])
                data['Title'] = (course_info["title"])
                data['Category'] = (course_info["prefixTitle"])
                data['Description'] = (course_info["description"])
                data['Comments'] = ("")
                writer.writerow(data)
                
    except IOError:
        print("I/O error")


def main():
    courses = {}
    course_categories = get_course_categories()
    populate_courses_in_categories(course_categories, courses)
    create_course_csv(courses)
    

main()