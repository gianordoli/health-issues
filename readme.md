# Shiny

This repo was built using this [Shiny App on Heroku boilerplate](https://github.com/virtualstaticvoid/heroku-shiny-app)

On the first deploy you'll need to install your package dependencies on Heroku. To to that, rename '_init.R' to 'init.R'. Then do:
```
git push heroku master
```

Don't forget to rename the file back again after that, otherwise Heroku will reinstall the packages every time you deploy and this will take a long time.