//
//  AppSettings.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

final class AppSettings {
    static let shared = AppSettings()

    private init() {}  // Prevent outside initialization

    private let onboardingKey = "hasCompletedOnboarding"

    var hasCompletedOnboarding: Bool {
        get {
            UserDefaults.standard.bool(forKey: onboardingKey)
        }
        set {
            UserDefaults.standard.set(newValue, forKey: onboardingKey)
        }
    }
}
