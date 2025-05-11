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
                    .font(.title)
                    .bold()
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                Spacer()
            }

            ZStack {
                ArcShape(startAngle: .degrees(180), endAngle: .degrees(360))
                    .stroke(chartDataObj.color.opacity(0.3), lineWidth: 45)

                ArcShape(startAngle: .degrees(180), endAngle: .degrees(180 + (Double(chartDataObj.percent / 100) * 180)))
                    .stroke(chartDataObj.color, lineWidth: 45)
                    .animation(.easeInOut(duration: 1.0), value: chartDataObj.percent)

                Text("\(Int(chartDataObj.percent))%")
                    .font(.title)
                    .bold()
                    .foregroundColor(.black)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    .offset(y: Double((250 / 3) * sizeCategory.customMinScaleFactor))
                    .accessibilityHidden(true) // Hide visual label from VoiceOver
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(chartDataObj.type) Usage")
            .accessibilityValue("\(Int(chartDataObj.percent)) percent used")
            .accessibilityHint("Semi-circular chart showing current \(chartDataObj.type.lowercased()) usage")
            
            Spacer()
        }
        .frame(width: 300, height: 250)
        .padding()
        .background(Color(red: 1, green: 0.961, blue: 0.882))
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
