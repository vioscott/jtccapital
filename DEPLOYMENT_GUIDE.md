# 🚀 Deployment Guide: Vercel + Namecheap Domain

This guide provides step-by-step instructions to deploy your application to Vercel and connect it to a custom domain purchased from Namecheap.

## Step 1: Push Your Code to GitHub (Done!)
You've already pushed your code to your GitHub repository (`github.com/vioscott/jtccapital`), including the `vercel.json` file we created for proper routing. This is exactly what Vercel needs!

## Step 2: Deploy the App to Vercel
1. Go to [Vercel](https://vercel.com/) and create an account or sign in.
2. Click on the **Add New...** button and select **Project**.
3. Under "Import Git Repository", search for `jtccapital` and click **Import**.
4. **Configure Project:**
   - **Framework Preset:** Vercel should automatically detect `Vite` (or `Create React App` depending on your setup).
   - **Build Command:** It should default to `npm run build` (or `tsc -b && vite build` which is correct).
   - **Install Command:** It should default to `npm install`.
5. Click **Deploy**. Vercel will now build and deploy your app. Once it finishes, you'll get a temporary `*.vercel.app` domain.

## Step 3: Purchase Your Domain on Namecheap
1. Go to [Namecheap.com](https://www.namecheap.com/) and create an account or sign in.
2. Use the search bar to find your desired domain name and complete the checkout process to purchase it.

## Step 4: Add Domain to Vercel
1. Go back to your project dashboard in Vercel.
2. Click on the **Settings** tab.
3. Select **Domains** from the left sidebar.
4. In the input field, type the domain you just purchased from Namecheap (e.g., `yourdomain.com`) and click **Add**.
5. Vercel will recommend adding both `yourdomain.com` and `www.yourdomain.com`. Select the recommended option and click **Add**.
6. Vercel will now show an "Invalid Configuration" error. This is expected! Below the error, Vercel will give you the **DNS Records** you need to add to Namecheap. Keep this page open.

## Step 5: Configure DNS Records in Namecheap
1. Go to your [Namecheap Dashboard](https://ap.www.namecheap.com/).
2. Click on **Domain List** on the left.
3. Find your newly purchased domain and click the **Manage** button next to it.
4. Go to the **Advanced DNS** tab at the top.
5. In the **Host Records** section, you need to add the records Vercel gave you. Typically, you need to add two records. 

First, delete any existing default Namecheap records (like parking pages) using the trash can icon.

Then, click **Add New Record** to add the following:

**Record 1 (For the root domain - yourdomain.com):**
- **Type:** `A Record`
- **Host:** `@`
- **Value:** `76.76.21.21` (Verify this exact IP address on your Vercel Domains page)
- **TTL:** `Automatic` (or smallest available like 1 min)

**Record 2 (For the www subdomain - www.yourdomain.com):**
- **Type:** `CNAME Record`
- **Host:** `www`
- **Value:** `cname.vercel-dns.com`
- **TTL:** `Automatic` (or smallest available like 1 min)

*Make sure to click the green checkmark (Save Changes) next to each record after entering the details.*

## Step 6: Wait for DNS Propagation
1. Go back to your Vercel Domains page.
2. Vercel will periodically check if the DNS records are correct. It usually takes anywhere from a few minutes to an hour for the DNS changes to "propagate" across the internet globally.
3. Once Vercel detects the correct records, the status will turn to a **Valid Configuration** state (a green checkmark or blue circle).
4. Vercel will automatically generate SSL certificates for you, and your site will be live securely at your custom Namecheap domain!

> **Note:** If you run into build errors during Step 2, log into Vercel and check the "Build Logs". It will highlight exactly what failed (e.g., a TypeScript error or missing environment variable).
