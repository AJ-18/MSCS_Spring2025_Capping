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
    static let incorrectCredentials = "Invalid credentials or network error."
    static let welcomeBack = "Welcome Back"
    static let login = "LOGIN"
    static let Username = "Username"
    static let Password = "Password"
    static let submit = "Submit"
    static let searchIcon  = "It's icon for searching device."
    static let searchText = "Search devices..."
    static let sdearchText = "Search devices..."
    static let emptyscreenmsg = "You need to have at least one Desktop APP."
    static let downloadApp = "Download SPAR Desktop"
    
    // device detail
    static let deviceInfo = "Device Info"
    static let deviceName = "Device Name"
    static let manufacturer = "Manufacturer"
    static let model = "Model"
    static let processor = "Processor"
    static let physicalCore = "Physical Cores"
    static let logicalCores = "Logical Cores"
    static let RAM = "RAM"
    static let graphics = "Graphics"
    static let OS = "OS"
    static let systemType = "System Type"
    static let registeredAt = "Time Stamp"
    static let batteryInfo = "Battery Info"
    static let cpu = "CPU"
    static let memoryUsage = "Ram Usage"
    static let diskUsage = "Disk Usage"
    static let diskIO = "Disk IO"
    static let processlist = "Running Processes"
    static let details = "Details"
    static let diskIOUssage = "Disk I/O Usage"
    
    // battery detail
    static let batteryStatus = "Battery Status"
    static let Charging = "Charging"
    static let batYes = "Yes ⚡️"
    static let batNo = "No❗️"
    static let power = "Power Consumption"
    
    // memeory
    static let totalMemeory = "Total Memory"
    static let usedMemory = "Used Memory"
    static let availableMemory = "Available Memory"
    
    // process
    static let processMonitor = "Process Monitor"
    static let metric =  "Metric"
    static let cpuUsage = "CPU Usage"
    static let memory = "Memory"
    static let process = "Process"
    
    // diskUsage
    static let filesystem = "Filesystem"
    static let size = "Total Size"
    static let usedSpace = "Used Space"
    static let availableSpace = "Available Space"
    // cpu
    static let totalCPULoad = "Total CPU Load"
    static let allCore = "All Core Usage"
    static let topFive = "Top 5 Core Usage"
    
    // diskio
    static let RS = "Read Speed (MBps)"
    static let WS = "Write Speed (MBps)"
    static let diskIOChart = "Disk I/O Chart"
    

    
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
    static let logout = "rectangle.portrait.and.arrow.right"
    static let emptyScreenlogo = "desktopcomputer"
    static let faceid = "faceid"
    static let cpu = "cpu"
    static let memorychip = "memorychip"
    
}

enum LoggerConstant {
    static let pageName = "❕Page visited: %@"
    static let getStartedTapped = "❕Get Started button was tapped"
    static let LoginSubmitTapped = "❕Submit button was tapped"
}

enum AccessibilityConstant {
    static let signOut = "Sign Out"
    static let metricPicker = "Metric Picker"
    static let processtip1 = "Double tap to view more process details"
    static let top5 = "Top five CPU cores by usage"
    static let barChart = "Bar chart showing the five CPU cores with highest utilization"
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
