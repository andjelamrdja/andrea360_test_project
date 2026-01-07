import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, CreditCard, Activity, TrendingUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface MemberDashboardProps {
  memberId: string;
}

export function MemberDashboard({ memberId }: MemberDashboardProps) {
  // not used yet (backend integration later)
  void memberId;

  const upcomingAppointments = [
    {
      id: "1",
      service: "Yoga Session",
      date: "Today",
      time: "10:00 AM",
      location: "Downtown Center",
    },
    {
      id: "2",
      service: "CrossFit Training",
      date: "Tomorrow",
      time: "2:00 PM",
      location: "Downtown Center",
    },
    {
      id: "3",
      service: "Pilates",
      date: "Jan 8",
      time: "6:00 PM",
      location: "Westside Studio",
    },
  ];

  const availableCredits = [
    { service: "CrossFit Training", credits: 8 },
    { service: "Yoga Session", credits: 5 },
    { service: "HIIT Workout", credits: 3 },
    { service: "Pilates", credits: 10 },
  ];

  const activityStats = [
    { label: "Classes Attended", value: "24", period: "This month" },
    { label: "Total Credits", value: "26", period: "Remaining" },
    { label: "Active Days", value: "12", period: "This month" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome back, Member!
        </h2>
        <p className="text-slate-500 mt-1">
          Here's your fitness journey overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {activityStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{stat.period}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No upcoming appointments</p>
                <Button className="mt-4">Book a Class</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {apt.service}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {apt.date} at {apt.time}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {apt.location}
                        </p>
                      </div>
                      <Badge variant="outline">Confirmed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              My Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableCredits.map((credit, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">
                      {credit.service}
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {credit.credits} left
                    </Badge>
                  </div>
                </div>
              ))}

              <Button className="w-full mt-4" variant="outline">
                Buy More Credits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 text-base">
              <Calendar className="w-5 h-5 mr-2" />
              Book a Class
            </Button>
            <Button variant="outline" className="h-20 text-base">
              <CreditCard className="w-5 h-5 mr-2" />
              Purchase Credits
            </Button>
            <Button variant="outline" className="h-20 text-base">
              <TrendingUp className="w-5 h-5 mr-2" />
              View Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
