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
