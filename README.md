# Farmers First

Farmers First is a P2P loan platform connecting rural farmers with lenders for fair loans. Farmers use a React Native app to complete eKYC, check credit scores, apply for loans, and accept bids. Lenders access a React web app to view applications, bid, and access reports. Admins manage bids and deploy smart contracts on the blockchain using solidity. Built on Vultr, with Node.js, MySQL, and object storage, Farmers First ensures secure, transparent transactions and promotes financial inclusion.

![Tech Titans drawio (1)](https://github.com/user-attachments/assets/d8da781e-3ce3-443b-8eb3-b46324a4fcc7)
## Features
- Secure Authentication: Aadhaar OTP login and selfie-based eKYC.

- Loan Management: Application, tracking, and competitive bidding.
- Bid Handling: Accept bids and manage offers seamlessly.
- Blockchain Security: Immutable smart contracts for agreements.
- Integrated UI: Unified mobile and web interfaces.
- Admin Oversight: Centralized loan and bid monitoring.

## External Service References

#### Twilio API

Required API Parameters - [Refer Documentation](https://www.twilio.com/docs/verify/api)
```http
  client.verify.v2.services
```

| Variable | Type     | Description                |
| :------- | :------- | :------------------------- |
| `TWILIO_ACC_ID`     | `string` | Account Service Id |
| `TWILIO_VERIFY_ID`  | `string` | Verify Service Id |
| `TWILIO_AUTH_TOKEN` | `string` | Your API Key |

**Refer the above documentation for code snippets and example response for the sms based otp verification service provided by twilio**

#### Vultr Database

Used for spinning up your own [Database Server](https://www.vultr.com/products/managed-databases/)

| Variable | Type     | Description                       |
| :------- | :------- | :-------------------------------- |
| `DB_HOST`      | `URL` | Host Endpoint |
| `DB_PORT`      | `number` | Port |
| `DB_USER`      | `string` | username |
| `DB_PASSWORD`  | `string` | password |
| `DB_NAME`      | `string` | database |

**Go to [dev.mysql.com](https://dev.mysql.com/downloads/workbench/) to set up your own MySQL WorkBench and establish your connection with the above provided credentials**

## Environment Variables

To run this project, you will need to add the above mentioned variables to your .env file in the backend folder

## Run Locally

Clone the project with github submodules

```bash
  git clone --recurse-submodules https://github.com/sandeepB3/vultr.git
```

Open 3 terminals and go to the each of the project directories 

```bash
  cd backend
  cd app-interface
  cd web-interface
```

Install dependencies in all

```bash
  npm install
```

### Step 1: Setup your backend server
Create .env file in backend folder & fill the env variables as stated above

```bash
  touch .env
```
Once you have setup the enviorment variables run the server

```bash
  nodemon index.js
```

Now since the backend is up, one can access this saved [Postman Backend Routes](https://documenter.getpostman.com/view/22520909/2sAY52byYs#c7f0089a-4f2c-49f8-a035-30cdd84dda0f) and test the apis.

### Step 2: Start your Farmers First Mobile App

Start Client and scan the expo QR code using expo app

```bash
  npm start
```

### Step 3: Start your Farmers First Web App

Start Client localhost and run the app in your prefered browser

```bash
  npm start
```
