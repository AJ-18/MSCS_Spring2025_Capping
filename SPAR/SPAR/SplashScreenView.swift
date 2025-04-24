//
//  SplashScreenView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

struct SplashScreenView: View {
    @Binding var currentView: AppView

    var body: some View {
        VStack {
            Image(ImageConstant.logo)
                .resizable()
                .scaledToFit()
                .frame(height: 500)
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                    if AppSettings.shared.hasCompletedOnboarding {
                        currentView = .login
                    } else {
                        currentView = .onboarding
                    }
                }
            }
        }
    }
}

#Preview {
    SplashScreenView(currentView: .constant(.splash))
}
