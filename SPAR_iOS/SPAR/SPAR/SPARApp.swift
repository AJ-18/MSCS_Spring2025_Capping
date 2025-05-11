//
//  SPARApp.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/2/25.
//

import SwiftUI
import OSLog

@main
struct SPARApp: App {
    init() {
          // Check if we're running in UI Test mode
          if ProcessInfo.processInfo.arguments.contains("-resetDefaults") {
              let domain = Bundle.main.bundleIdentifier!
              UserDefaults.standard.removePersistentDomain(forName: domain)
              UserDefaults.standard.synchronize()
              print("UserDefaults reset for UI Test")
          }
      }

    let logger = Logger.fileLocation
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onAppear{
                    logger.info("\(URL.documentsDirectory.path())")
                }
        }
    }
}
