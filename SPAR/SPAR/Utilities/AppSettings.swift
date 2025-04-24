//
//  AppSettings.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

final class AppSettings {
    static let shared = AppSettings()
    
    private init() {}

    private let onboardingKey = "hasCompletedOnboarding"
    private let tokenKey = "authToken"
    private let userIdKey = "userId"

    var hasCompletedOnboarding: Bool {
        get { UserDefaults.standard.bool(forKey: onboardingKey) }
        set { UserDefaults.standard.set(newValue, forKey: onboardingKey) }
    }

    var authToken: String? {
        get { UserDefaults.standard.string(forKey: "authToken") }
        set { UserDefaults.standard.set(newValue, forKey: "authToken") }
    }

    var userId: Int? {
        get { UserDefaults.standard.integer(forKey: "userId") }
        set { UserDefaults.standard.set(newValue, forKey: "userId") }
    }

}
