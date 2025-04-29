//
//  HalfDonutChart.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 3/15/25.
//

import SwiftUI

struct HalfDonutChart: View {
    @Binding var chartDataObj: ChartData
    @Environment(\.sizeCategory) var sizeCategory
    
    var body: some View {
        VStack {
            HStack {
                Text(chartDataObj.type)
                    .font(/*@START_MENU_TOKEN@*/.title/*@END_MENU_TOKEN@*/)
                    .bold()
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                Spacer()
            }
            ZStack {
                // Default background semi-circle
                ArcShape(startAngle: .degrees(180), endAngle: .degrees(360))
                    .stroke(chartDataObj.color.opacity(0.3), lineWidth: 45)
                
                // Foreground arc for current data
                ArcShape(startAngle: .degrees(180), endAngle: .degrees(180 + (Double(chartDataObj.percent / 100) * 180)))
                    .stroke(chartDataObj.color, lineWidth: 45)
                    .animation(.easeInOut(duration: 1.0), value: chartDataObj.percent)
                
                // Percentage text
                Text("\(Int(chartDataObj.percent))%")
                    .font(.title)
                    .bold()
                    .foregroundColor(.black)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    .offset(y: Double((250 / 3) * sizeCategory.customMinScaleFactor)) // Move text inside the arc
            }
            Spacer()
            
            /* // Button to Change Data Manually
             Button("Change Data") {
             updateData()
             }
             .padding()
             .background(Color.blue)
             .foregroundColor(.white)
             .clipShape(Capsule())
             }*/
        }
        .frame(width: 300, height: 250)
        .padding()
        .background(Color(red: 1, green: 0.961, blue: 0.882))
       
        
        // Function to manually update the data
        /* private func updateData() {
         let newValues: [ChartData] = [
         ChartData(color: Color(#colorLiteral(red: 1, green: 0.493, blue: 0.474, alpha: 1)), percent: 25),
         ChartData(color: Color(#colorLiteral(red: 1, green: 0.832, blue: 0.473, alpha: 1)), percent: 50),
         ChartData(color: Color(#colorLiteral(red: 0.451, green: 0.988, blue: 0.838, alpha: 1)), percent: 75),
         ChartData(color: Color(#colorLiteral(red: 0.477, green: 0.505, blue: 1, alpha: 1)), percent: 100)
         ]
         
         withAnimation {
         chartDataObj.currentData = newValues.randomElement()!
         }
         }*/
    }
}

struct ArcShape: Shape {
    var startAngle: Angle
    var endAngle: Angle

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let radius = min(rect.width, rect.height)
        let center = CGPoint(x: rect.midX, y: rect.maxY) // Align bottom-center

        path.addArc(center: center, radius: radius/1.9, startAngle: startAngle, endAngle: endAngle, clockwise: false)
        return path
    }
}

#Preview {
    HalfDonutChart(chartDataObj: .constant(ChartData(color: Color(#colorLiteral(red: 1, green: 0.493, blue: 0.474, alpha: 1)), type: "CPU", percent: 30)))
}
