# NetFynd

NetFynd is a **startup network finder application** that helps **founders** connect with **investors** or **mentors** based on specific criteria. Users can **search for potential investors/mentors**, and the system recommends the best match using **Gemini AI**.

🚀 **Live Demo:** [net-fynd.vercel.app](https://net-fynd.vercel.app/) 

## 🚀 Features

### ✅ Authentication
- Users must **log in** using their **Gmail account** via Clerk authentication.

### 🔍 Search Functionality
- Users enter a **query** describing their startup needs.
- The backend **processes the query** along with database data and sends it to **Gemini AI**.
- The AI suggests the most **relevant investors or mentors**.

### 💳 Credit System
- Each user starts with **5 credits**.
- Every search **reduces 1 credit**.
- If the credits reach **0**, users receive an **email** prompting them to **recharge**.

### ✉️ Gmail API Integration (Recharge System)
- Users can **recharge credits** by sending an email with the subject **"recharge 5 credits"**.
- If the **same user tries again**, they receive a **denial email**.

## 🛠 Tech Stack

### **Frontend**
- **Next.js (React framework)**
- **Tailwind CSS** (for styling)
- **Clerk Authentication** (Google Login)

### **Backend**
- **Next.js API Routes** (Serverless backend)
- **MongoDB** (Database)
- **Gemini AI API** (for investor recommendations)
- **Gmail API** (for credit recharge email detection)

## 📡 API Routes

| Route             | Method | Description                                      |
|------------------|--------|--------------------------------------------------|
| `/api/search`    | `POST` | Processes search queries & returns recommendations |
| `/api/user`      | `GET`  | Retrieves user information & credits            |
| `/api/email/send`| `POST` | Sends recharge email to users                   |
| `/api/email/check` | `GET` | Checks for recharge emails from users          |

## 🚀 How It Works

1. **User logs in** with their Google account.
2. **User searches** for an investor/mentor.
3. **System processes the query** and finds the best match.
4. **1 credit is deducted** per search.
5. **If credits are exhausted**, the user gets a recharge email.
6. **User sends a recharge request email**.
7. **System detects the email** and recharges the credits.

## 📌 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/netfynd.git
   cd netfynd
    ```

2. Install dependencies:

```sh
npm install
```

3. Set up environment variables in .env.local

4. Run the project:
```
npm run dev
```

