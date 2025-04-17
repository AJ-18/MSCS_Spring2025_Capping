//
//  View+Extension.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/21/25.
//

import SwiftUI
import OSLog

extension View {
    func logPageVisit() {
        let logger = Logger.fileLocation
        let structureName = String(describing: type(of: self)) // Get the structure name dynamically
        logger.info("\(String(format: LoggerConstant.pageName, arguments: [structureName]))")
    }
}
