//
//  NavigationButton.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

struct NavigationButton<Destination: View>: View {
    let title: String
    let destination: Destination
    @State private var isPressed = false

    init(title: String, @ViewBuilder destination: () -> Destination) {
        self.title = title
        self.destination = destination()
    }

    var body: some View {
        NavigationLink(destination: destination) {
            HStack {
                Text(title)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.white)
                    .accessibilityLabel("Next") // Added accessibility label for screen readers
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(LinearGradient(colors: [Color.purple, Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.white.opacity(0.25), lineWidth: 1)
            )
            .shadow(color: Color.blue.opacity(0.5), radius: 10, x: 0, y: 5)
            .scaleEffect(isPressed ? 0.97 : 1.0)
           
            .accessibilityElement(children: .ignore) // Ensures only the button's main label is read by screen readers
            .accessibilityAddTraits(.isButton) // Marks this as a button for screen readers
            .focusable(true) // Make sure it is focusable for keyboard navigation
        }
    }
}


