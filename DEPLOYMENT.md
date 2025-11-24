# Deploying Personal Diary to GitHub Pages

This guide will help you deploy your Personal Diary app to GitHub Pages so you can access it from anywhere.

## Prerequisites

- A GitHub account
- Git installed on your computer

## Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `personal-diary`)
4. Choose "Public" or "Private" (both work with GitHub Pages)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 2. Initialize Git in Your Project

Open a terminal/command prompt in your project folder (`d:\MYAPPS\journaling-app\PersonalDiary-master\`) and run:

```bash
git init
git add .
git commit -m "Initial commit - Personal Diary app"
```

### 3. Connect to GitHub and Push

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"

### 5. Access Your App

After a few minutes, your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## Important Notes

### Data Storage

Your diary app uses:
- **LocalStorage**: Stores data in your browser (works offline)
- **JSONBin API**: Syncs data to the cloud

**Important**: LocalStorage data is specific to each browser/device. If you access your app from different devices or browsers, you'll need to rely on the JSONBin sync.

### Security Considerations

⚠️ **API Keys**: Your JSONBin API keys are currently in the code. For a public repository, consider:

1. **Option 1 (Recommended)**: Use environment variables
   - Create a `.env` file (add to `.gitignore`)
   - Use a build tool like Vite or webpack to inject variables
   
2. **Option 2**: Keep repository private
   - Only you can see the code and API keys
   
3. **Option 3**: Use backend proxy
   - Create a simple backend to hide API keys

### Updating Your Deployed App

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically update your site within a few minutes.

## Troubleshooting

### App not loading?
- Check the browser console for errors
- Ensure all file paths are relative (not absolute `file://` paths)
- Wait a few minutes after pushing - GitHub Pages takes time to build

### Data not syncing?
- Check your JSONBin API keys are correct
- Check browser console for API errors
- Ensure you have internet connection

### 404 Error?
- Make sure `index.html` is in the root of your repository
- Check GitHub Pages settings are correct
- Try accessing with `/index.html` at the end of URL

## Alternative: Deploy to Netlify

If you prefer Netlify (easier setup):

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up/login
3. Drag and drop your project folder
4. Your site is live instantly!

## Need Help?

- GitHub Pages Docs: https://docs.github.com/en/pages
- JSONBin Docs: https://jsonbin.io/api-reference
