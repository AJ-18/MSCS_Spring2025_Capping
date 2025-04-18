//
//  DeviceDetail.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import SwiftUI

struct DeviceDetail: View {
    @Binding var currentView: AppView
    @ObservedObject var chartDataObj = ChartDataContainer()
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 20) { // Adds spacing between elements
                HStack {
                    Text("S.P.A.R")
                        .fontWeight(.heavy)
                        .font(Font.system(size: 48))
                        .padding(.horizontal,5)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                       
                    
                    Spacer()
                }
                HStack {
                    Text(StringConstant.Dashboard)
                        .fontWeight(.heavy)
                        .font(Font.system(size: 28))
                        .padding(.horizontal,10)
                    
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        .accessibility(.dashboardTitle)
                    
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
    HomeView(currentView: .constant(.detailPage))
}
