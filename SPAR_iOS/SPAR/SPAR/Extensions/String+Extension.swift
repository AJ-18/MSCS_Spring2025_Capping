//
//  String+Extension.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

extension String {
    func toFormattedDate() -> String {
        // Define the input date format (ISO 8601)
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"
        
        // Convert the string into a Date object
        if let date = inputFormatter.date(from: self) {
            // Define the desired output format
            let outputFormatter = DateFormatter()
            outputFormatter.dateStyle = .medium
            outputFormatter.timeStyle = .short
            // Return the formatted date string
            return outputFormatter.string(from: date)
        }
        return ""
    }
}
