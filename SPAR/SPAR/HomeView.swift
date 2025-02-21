//
//  HomeView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI

// Dummy Home screen
struct HomeView: View {
    var body: some View {
        VStack{
            Text("Welecome to Home Screen")
                .font(.title)
                .fontWeight(.heavy)
        }.onAppear{
            self.logPageVisit()
        }
    }
}

#Preview {
    HomeView()
}
