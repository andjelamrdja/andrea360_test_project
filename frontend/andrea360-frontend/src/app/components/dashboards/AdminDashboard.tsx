import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  MapPin,
  Users,
  UserCircle,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Badge } from "../ui/badge";

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Locations",
      value: "8",
      change: "+2 this month",
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Employees",
      value: "42",
      change: "+5 this month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Members",
      value: "1,248",
      change: "+127 this month",
      icon: UserCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenue (EUR)",
      value: "€42,580",
      change: "+18% this month",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  const recentActivity = [
    {
      action: "New location created",
      detail: "Downtown Fitness Center",
      time: "2 hours ago",
    },
    {
      action: "New employee added",
      detail: "John Doe - CrossFit Trainer",
      time: "4 hours ago",
    },
    {
      action: "Member signed up",
      detail: "Jane Smith joined Premium Plan",
      time: "5 hours ago",
    },
    {
      action: "Appointment booked",
      detail: "Yoga class - 15 attendees",
      time: "6 hours ago",
    },
  ];

  const upcomingAppointments = [
    {
      service: "CrossFit Training",
      time: "Today, 10:00 AM",
      location: "Downtown Center",
      capacity: "18/20",
      status: "filling",
    },
    {
      service: "Yoga Session",
      time: "Today, 2:00 PM",
      location: "Westside Studio",
      capacity: "12/15",
      status: "available",
    },
    {
      service: "HIIT Workout",
      time: "Tomorrow, 8:00 AM",
      location: "Northside Gym",
      capacity: "20/20",
      status: "full",
    },
    {
      service: "Pilates",
      time: "Tomorrow, 6:00 PM",
      location: "Downtown Center",
      capacity: "8/12",
      status: "available",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Overview of your fitness center network
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{apt.service}</p>
                    <p className="text-sm text-slate-500">{apt.time}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {apt.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">
                      {apt.capacity}
                    </span>
                    <Badge
                      variant={
                        apt.status === "full"
                          ? "destructive"
                          : apt.status === "filling"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {apt.status === "full"
                        ? "Full"
                        : apt.status === "filling"
                        ? "Filling"
                        : "Available"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-slate-600">{activity.detail}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {activity.time}
                    </p>
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
