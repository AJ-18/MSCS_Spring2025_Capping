//
//  OnBoardingScreenView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

struct OnBoardingScreenView: View {
    let imageName: String
    let title: String
    let description: String
    var showButton: Bool = false
    
    var body: some View {
        VStack(spacing: 20) {
            Image(imageName)
                .resizable()
                .scaledToFit()
                .frame(height: 300)
            Text(title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            Text(description)
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            if showButton {
                NavigationLink(destination: HomeView()) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(10)
                        .padding(.horizontal, 40)
                }
            }
        }
    }
}

#Preview {
    OnBoardingScreenView(imageName: ImageConstant.welcomeImage, title: StringConstant.welcomeTitle, description: StringConstant.welcomeDescription)
}
