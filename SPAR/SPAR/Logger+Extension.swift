//
//  Logger+Extension.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import Foundation
import OSLog

extension Logger {
    static let subsytem = Bundle.main.bundleIdentifier ?? ""
    static let fileLocation = Logger(subsystem: subsytem, category: "FileLocation")
    static let dataStore = Logger(subsystem: subsytem, category: "DataStore")
    static let fileManager = Logger(subsystem: subsytem, category: "FileManager")
}
