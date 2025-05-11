//
//  BackgroundAnimationView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import SwiftUI

struct BackgroundAnimationView: View {
    @Binding var animate: Bool

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.blue.opacity(0.2))
                .frame(width: 100, height: 100)
                .offset(x: animate ? -140 : -160, y: animate ? -290 : -310)
                .animation(Animation.easeInOut(duration: 4).repeatForever(autoreverses: true), value: animate)

            RoundedRectangle(cornerRadius: 25)
                .fill(Color.purple.opacity(0.2))
                .frame(width: 200, height: 100)
                .rotationEffect(.degrees(animate ? 20 : 10))
                .offset(x: animate ? 110 : 130, y: animate ? -240 : -260)
                .animation(Animation.easeInOut(duration: 5).repeatForever(autoreverses: true), value: animate)

            Circle()
                .fill(Color.green.opacity(0.2))
                .frame(width: 150, height: 150)
                .offset(x: animate ? 140 : 160, y: animate ? 290 : 310)
                .animation(Animation.easeInOut(duration: 6).repeatForever(autoreverses: true), value: animate)

            RoundedRectangle(cornerRadius: 50)
                .fill(Color.orange.opacity(0.15))
                .frame(width: 120, height: 120)
                .rotationEffect(.degrees(animate ? 45 : 0))
                .offset(x: animate ? -100 : -120, y: animate ? 250 : 270)
                .animation(Animation.easeInOut(duration: 7).repeatForever(autoreverses: true), value: animate)

            Circle()
                .fill(Color.red.opacity(0.1))
                .frame(width: 80, height: 80)
                .offset(x: animate ? 80 : 100, y: animate ? 100 : 120)
                .animation(Animation.easeInOut(duration: 5).repeatForever(autoreverses: true), value: animate)
        }
    }
}


#Preview {
    BackgroundAnimationView(animate: .constant(true))
}
