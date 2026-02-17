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
    { label: 'Total Tasks', value: tasks.length, icon: ListTodo, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Running Jobs', value: runningJobs, icon: Play, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Completed', value: completedJobs, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Failed', value: failedJobs, icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/30' },
  ];

  return (
    <div className="p-8">
      <Header
        title="Dashboard"
        description="Overview of your Alma Analytics report tasks and jobs."
        onRefresh={() => {
          fetchTasks();
          fetchJobs();
        }}
      />

      <section className="mb-10">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Overview</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-xl transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <p className="py-8 text-center text-slate-500 dark:text-slate-400">Loading...</p>
            ) : recentJobs.length === 0 ? (
              <p className="py-8 text-center text-slate-500 dark:text-slate-400">
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
      </section>
    </div>
  );
}
