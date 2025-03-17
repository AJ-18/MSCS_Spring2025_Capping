//
//  HomeView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 2/20/25.
//

import SwiftUI
import Charts


struct HomeView: View {
    @Binding var currentView: AppView
    @ObservedObject var chartDataObj = ChartDataContainer()
  
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 20) { // Adds spacing between elements
                HStack {
                    Text("S.P.A.R")
                        .fontWeight(.heavy)
                        .font(Font.system(size: 48))
                        .padding(.horizontal,5)
                       
                    
                    Spacer()
                }
                HStack {
                    Text("Dashboard")
                        .fontWeight(.heavy)
                        .font(Font.system(size: 28))
                        .padding(.horizontal,10)
                    
                    Spacer()
                }
                
                HalfDonutChart(chartDataObj: $chartDataObj.cpuData)
                HalfDonutChart(chartDataObj: $chartDataObj.MemooryData)
                HalfDonutChart(chartDataObj: $chartDataObj.diskData)
              

                Spacer() // Adds spacing at the bottom
            }
            .padding() // Adds padding to the VStack
        }
        .onAppear {
            self.logPageVisit()
      
        }
    }
}


#Preview {
    HomeView(currentView: .constant(.home))
}
