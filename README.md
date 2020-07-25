# PennCourseSearch

[Penn Course Search](https://penn-course-search.herokuapp.com/) is a web app for finding UPenn classes. You can find information about classes
with their code('CIS120'), their title('Engineering Entrepreneurship I'), or keywords('wine').

## Serving Static Files

1. Clone the repo and ensure you have Node installed locally to precompile the code.

2. Run `npm run build:app` from the project directory to generate client/build, where the static files will be placed
    1. Email henryRgarant@gmail.com to allow your website to use the GOOGLE API KEY or create your own key in the .env file. 

3. Serve the static files in client/build using Nginx, Apache, or other web server software.
    1. Make sure the entry point is index.html and index.html is found in client/build.
    2. See *[nginx.conf](https://github.com/Henri93/PennCourseSearch/blob/clientLoads/nginx.conf)* for an example nginx configuration file.


## Support

<a href="https://www.buymeacoffee.com/henrygarant" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## License
[MIT](https://choosealicense.com/licenses/mit/)