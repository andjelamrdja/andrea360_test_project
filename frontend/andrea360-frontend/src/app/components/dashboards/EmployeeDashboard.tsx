import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface EmployeeDashboardProps {
  locationId: string;
}

type AptStatus = "upcoming" | "full";

export function EmployeeDashboard({ locationId }: EmployeeDashboardProps) {
  // not used yet (backend integration later)
  void locationId;

  const todayAppointments: Array<{
    id: string;
    service: string;
    time: string;
    booked: number;
    capacity: number;
    status: AptStatus;
  }> = [
    {
      id: "1",
      service: "CrossFit Training",
      time: "08:00 - 09:00",
      booked: 18,
      capacity: 20,
      status: "upcoming",
    },
    {
      id: "2",
      service: "Yoga Session",
      time: "10:00 - 11:00",
      booked: 15,
      capacity: 15,
      status: "full",
    },
    {
      id: "3",
      service: "HIIT Workout",
      time: "14:00 - 15:00",
      booked: 12,
      capacity: 20,
      status: "upcoming",
    },
    {
      id: "4",
      service: "Pilates",
      time: "17:00 - 18:00",
      booked: 8,
      capacity: 12,
      status: "upcoming",
    },
    {
      id: "5",
      service: "Spin Class",
      time: "18:30 - 19:30",
      booked: 10,
      capacity: 15,
      status: "upcoming",
    },
  ];

  const stats = [
    { label: "Today's Appointments", value: "5", color: "text-blue-600" },
    { label: "Total Bookings", value: "63", color: "text-green-600" },
    { label: "Active Members", value: "156", color: "text-purple-600" },
    { label: "Capacity Used", value: "82%", color: "text-orange-600" },
  ];

  const recentBookings = [
    {
      member: "Sarah Johnson",
      service: "Yoga Session",
      time: "5 min ago",
      status: "confirmed",
    },
    {
      member: "Mike Peterson",
      service: "CrossFit Training",
      time: "12 min ago",
      status: "confirmed",
    },
    {
      member: "Emily Chen",
      service: "HIIT Workout",
      time: "25 min ago",
      status: "confirmed",
    },
    {
      member: "David Brown",
      service: "Pilates",
      time: "1 hour ago",
      status: "confirmed",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Employee Dashboard
        </h2>
        <p className="text-slate-500 mt-1">Downtown Fitness Center</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((apt) => {
                const capacityPercentage = (apt.booked / apt.capacity) * 100;
                const isFull = apt.booked >= apt.capacity;

                return (
                  <div key={apt.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {apt.service}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {apt.time}
                          </span>
                        </div>
                      </div>

                      <Badge variant={isFull ? "destructive" : "default"}>
                        {isFull ? "Full" : "Available"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Capacity</span>
                        <span className="font-medium text-slate-900">
                          {apt.booked}/{apt.capacity}
                        </span>
                      </div>

                      <Progress
                        value={capacityPercentage}
                        className={
                          isFull
                            ? "[&>div]:bg-red-500"
                            : capacityPercentage > 70
                            ? "[&>div]:bg-orange-500"
                            : "[&>div]:bg-blue-600"
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((booking, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {booking.member}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {booking.service}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {booking.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
