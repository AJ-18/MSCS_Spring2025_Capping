//
//  SplashScreenView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

struct SplashScreenView: View {
    @State private var isActive = false
    
    var body: some View {
        if isActive {
            OnboardingView()
            
        } else {
            VStack {
                Image(ImageConstant.logo)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 500)
            }
            .onAppear {
                self.logPageVisit()
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    withAnimation {
                        isActive = true
                    }
                }
            }
        }
    }
}
#Preview {
    SplashScreenView()
}
