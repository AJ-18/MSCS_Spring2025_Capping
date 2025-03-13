//
//  ContentView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/2/25.
//

import SwiftUI
import OSLog

struct ContentView: View {
    var body: some View {
        NavigationStack {
            SplashScreenView()
                .onAppear {
                    self.logPageVisit()
                }
        }
       
    }
}

#Preview {
    ContentView()
}
