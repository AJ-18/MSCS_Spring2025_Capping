//
//  ContentView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/2/25.
//

import SwiftUI
import OSLog

enum AppView: Hashable {
    case splash
    case onboarding
    case home
}

struct ContentView: View {
    @State private var currentView: AppView = .splash

    var body: some View {
        NavigationStack {
            switch currentView {
            case .splash:
                SplashScreenView(currentView: $currentView)
            case .onboarding:
                OnboardingView(currentView: $currentView)
            case .home:
                HomeView(currentView: $currentView)
            }
        }
    }
}

#Preview {
    ContentView()
}
