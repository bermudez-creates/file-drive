import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'clear files table',
  { minutes: 1 }, // every minute
  internal.files.removeFiles
);

export default crons;
