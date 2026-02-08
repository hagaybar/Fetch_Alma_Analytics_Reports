import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { JobStatusCard } from '../components/reports/JobStatus';
import { useTasks, useJobs } from '../hooks';
import { ListTodo, CheckCircle, AlertCircle, Play } from 'lucide-react';

export function Dashboard() {
  const { tasks, fetchTasks } = useTasks();
  const { jobs, loading: jobsLoading, fetchJobs } = useJobs();

  const recentJobs = jobs.slice(0, 5);
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const failedJobs = jobs.filter((j) => j.status === 'failed').length;
  const runningJobs = jobs.filter((j) => j.status === 'running' || j.status === 'pending').length;

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: ListTodo, color: 'text-blue-600' },
    { label: 'Running Jobs', value: runningJobs, icon: Play, color: 'text-amber-600' },
    { label: 'Completed', value: completedJobs, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Failed', value: failedJobs, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        onRefresh={() => {
          fetchTasks();
          fetchJobs();
        }}
      />

      <div className="p-6">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-full bg-gray-100 p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">Loading...</p>
            ) : recentJobs.length === 0 ? (
              <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                No jobs have been run yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <JobStatusCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
