# 🖥️ System Processes and Analysis Reporting (S.P.A.R)

**S.P.A.R** is a cross-platform system monitoring application for Ubuntu Linux that provides real-time insights into CPU, memory, disk usage, and running processes. It supports both desktop and mobile platforms, enabling users to track system health anytime, anywhere.

---

## 📦 Components

### 🔹 Desktop App (Electron + React)
- View real-time system metrics
- Responsive UI with Tailwind CSS
- Builds for `.exe`, `.deb`, `.tar.gz`

### 🔹 iOS App (SwiftUI)
- Monitors system metrics
- Supports accessibility: VoiceOver, Dynamic Type
- Face ID integration (Keychain)
- Interaction logging for future analytics

### 🔹 Backend Services
- RESTful API with **Spring Boot**
- Metrics collected using **Node.js** (`systeminformation`, `ps-list`)
- MySQL used for data storage
- API exposes CPU, memory, disk, battery, processes

---

## 🧰 Tech Stack

| Layer        | Technology                     |
|--------------|---------------------------------|
| Desktop UI   | Electron, React, Tailwind CSS   |
| Mobile App   | SwiftUI, Combine, Swift 5        |
| Backend API  | Spring Boot (Java), Node.js     |
| Data Storage | MySQL                           |
| Metrics Lib  | `systeminformation`, `ps-list`  |
| Tools        | Xcode 15, IntelliJ, VS Code        |

---

## 🚀 Getting Started

### 📁 Clone Repo
```bash
git clone https://github.com/MSCS-Capping/MSCS_Spring2025_Capping.git
cd MSCS_Spring2025_Capping
```

### 🖥️ Desktop App
```bash
cd desktop-app
npm install
npm start        # Dev mode
npm run package  # Build installer
```

### 📱 iOS App
1. cd SPAR_iOS
2. cd SPAR
1. Open `spar.xcodeproj` in Xcode 15
2. Run on simulator or device
3. View process metrics and test accessibility + logging features

### 🔧 Backend API
```bash
cd backend-api
./mvnw spring-boot:run
```

### 🟡 Node Metrics Collector
```bash
cd node-metrics
npm install
node collector.js
```

Ensure Spring Boot API is running before starting the Electron app.

---

## 🔄 Actions & Deployment

### ✅ GitHub Actions

- iOS app uses GitHub Actions to ensure **all unit and UI tests pass before any merge** into `main`
- CI workflow runs on macOS runners with Xcode configured
- Prevents broken code from being merged into production

```yaml
# .github/workflows/ios-tests.yml
name: iOS Tests
on: [pull_request]
jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Xcode
        run: xcodebuild -project iOSApp.xcodeproj -scheme iOSApp -destination 'platform=iOS Simulator,name=iPhone 14' test
```

### 🚀 Render Deployment

- Spring Boot backend is deployed using **Render**
- MySQL database also hosted via Render's managed database services
- Auto-deploy enabled from `main` branch
- Environment variables (DB credentials, API keys) are stored securely in Render's dashboard

---

## 🔐 Security & Testing

- ✅ Unit & Integration Tests for backend and frontend
- ♿ Accessibility tested with VoiceOver and Dynamic Type
- 🔒 Keychain integration for login credentials (iOS)
- 🔄 MySQL data backups and error recovery mechanisms

---

## 🌱 Future Enhancements

- Export reports (CSV, PDF)
- Android version
- Push Notification
- Chatbot

---

## 👥 Contributors

- **Abhijeet Cherungottil**  
  📧 [Abhijeet.Cherungottil1@marist.edu](mailto:Abhijeet.Cherungottil1@marist.edu)

- **Sumanth Kumar Katapally**  
  📧 [SumanthKumar.Katapally1@marist.edu](mailto:SumanthKumar.Katapally1@marist.edu)

- **Arjun Suresh (AJ)**  
  📧 [Arjun.Suresh1@marist.edu](mailto:Arjun.Suresh1@marist.edu)

---

## 🎥 Demo Video

📽️ Watch it here:  Coming Soon
[]()

---

## 📚 References

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [System Information (NPM)](https://www.npmjs.com/package/systeminformation)
- [SwiftUI Accessibility Guide](https://developer.apple.com/documentation/swiftui/accessibility)
- [Tailwind CSS](https://tailwindcss.com/)
- [Render Deployment Docs](https://render.com/docs/deploy-a-java-spring-boot-app)

---
