# Deploy on [Heroku](https://www.heroku.com/)
1. Run `heroku login`
2. Run `heroku git:remote -a <name_app_on_heroku>`
3. Add **Config Vars** based on `.env.example` file in App's settings on Heroku.
4. Run `npm run update:heroku`

# Add MongoDB Atlas connection string
1. Create cluster.
2. Click **Connect** button on cluster.
3. Chose option **Drivers**.
4. Copy connection string like `mongodb+srv://XXX:<db_password>@<name_of_cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<app_name>`

> `<db_password>` can find in Atlas settings `Database access` option. 