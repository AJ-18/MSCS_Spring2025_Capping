//
//  Constant.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import Foundation

enum StringConstant {
    static let appNameFullForm = "System Processes And Reports"
    static let appName = "S.P.A.R"
    static let welcomeTitle = "Welcome to \(appName)! Monitor Your System Health Anytime!"
    static let welcomeDescription = "Keep an eye on your system’s performance with real-time metrics at your fingertips."
    static let cpuTrackingTitle = "Track CPU & Disk Usage Effortlessly"
    static let cpuTrackingDescription = "View real-time CPU and disk utilization metrics to optimize system performance."
    static let alertsTitle = "Stay Notified with Critical Alerts!"
    static let alertsDescription = "Get instant alerts when system performance is at risk."
    static let desktopRequirementTitle = "Connect with Our Desktop App!"
    static let desktopRequirementDescription = "To use this mobile app, you need to install our desktop companion app."
    static let onboardingImages = "Onbording image of %@"
    static let getstarted = "Get Started"
    static let Dashboard = "Dashboard"
    static let incorrectCredentials = "Incorrect username or password."
    static let welcomeBack = "Welcome Back"
    static let login = "LOGIN"
    static let Username = "Username"
    static let Password = "Password"
    static let submit = "Submit"
    static let searchIcon  = "It's icon for searching device."
    static let searchText = "Search devices..."
    
}

enum ImageConstant {
    static let logo = "logo"
    static let welcomeImage = "3D Modern analytics webpage mockup"
    static let stopwatchImage = "3D colorful performance gauge"
    static let laptopGraphImage = "3D business analytics laptop"
    static let mobileNotificationImage = "3D mobile showing notification"
    static let magnifyingGlass =  "magnifyingglass"
    static let xmarkCircleFill =  "xmark.circle.fill"
    static let chevronRight =  "chevron.right"
      static let eye = "eye"
      static let eyeSlash =  "eye.slash"
    
}

enum LoggerConstant {
    static let pageName = "❕Page visited: %@"
    static let getStartedTapped = "❕Get Started button was tapped"
    static let LoginSubmitTapped = "❕Submit button was tapped"
}

enum AccessibilityIdentifier: String {
    case dashboardTitle
    case onboardingWelcome
    case onboardingCPU
    case onboardingAlerts
    case getStartedButton
    case cpuUsageLabel
    // Add more as needed
}
