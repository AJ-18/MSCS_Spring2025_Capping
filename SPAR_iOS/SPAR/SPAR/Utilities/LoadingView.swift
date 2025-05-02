//
//  LoadingView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 5/2/25.
//

import SwiftUI

struct LoadingView<Content: View>: View {
    let isLoading: Bool
    let content: () -> Content

    var body: some View {
        ZStack {
            content()
                .disabled(isLoading)
                .blur(radius: isLoading ? 2 : 0)

            if isLoading {
                VStack(spacing: 12) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                    Text("Loading...")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .padding(20)
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(radius: 10)
            }
        }
    }
}


