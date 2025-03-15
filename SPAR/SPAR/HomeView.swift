//
//  HomeView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI
import Charts

// Dummy Home screen
struct HomeView: View {
    var body: some View {
        VStack{
            Chart {
                BarMark(x: .value("item", "item"), y: .value("count", 5), width: 40)
            }
           
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
