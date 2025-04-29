//
//  ContentSizeCategory+Extension.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 3/17/25.
//

import SwiftUI

extension ContentSizeCategory {
    var customMinScaleFactor: CGFloat {
        switch self {
        case .extraSmall,.small, .medium:
            return 1.0
        case .large, .extraLarge, .extraExtraLarge:
            return 0.8
        default:
            return 0.6
        }
    }
}
