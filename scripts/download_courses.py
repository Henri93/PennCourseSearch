import re 
import requests
from bs4 import BeautifulSoup
from csv import DictReader, DictWriter
import gspread
from oauth2client.service_account import ServiceAccountCredentials

def get_course_categories():
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
    for category in course_categories:
        print(category)
        url = f'https://catalog.upenn.edu{category}index.html'
        html = requests.get(url)
        soup = BeautifulSoup(html.text, "html.parser")
        course_list = soup.find("div", {"class" : "sc_sccoursedescs"})
        
        if course_list is None:
            print(f'No courses for {category}')
            continue

        for course_block in course_list.find_all("div", {"class" : "courseblock"}):
            title = course_block.find("p", {"class" : "courseblocktitle"}).text
            description_items = []
            for course_description_extra in course_block.find_all("p", {"class" : "courseblockextra"}):
                description_items.append(course_description_extra.text)
            code, name = title.split("  ", 1)
            code = ''.join(code.split())
            code_info = re.findall(r'(\w+?)(\d+)', code)[0]
            
            course = {}
            course["title"] = name
            course["prefix"] = code_info[0]
            course["number"] = code_info[1]
            course["description"] = description_items
            courses[code] = course
        

def create_course_csv(courses):
    csv_columns = ['Prefix','Number','Title','Description','Comments']
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
                data['Description'] = (course_info["description"])
                data['Comments'] = ("")
                writer.writerow(data)
                
    except IOError:
        print("I/O error")

# def drive_function():
#     scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']
#     creds = ServiceAccountCredentials.from_json_keyfile_name('PennCourseSearch-9d511cb881d4.json', scope)
#     client = gspread.authorize(creds)
#     sheet = client.open('PennCourseSearch').sheet1
#     classes = sheet.get_all_records()
#     print(classes)

def main():
    courses = {}
    course_categories = get_course_categories()
    populate_courses_in_categories(course_categories, courses)
    create_course_csv(courses)
    

main()