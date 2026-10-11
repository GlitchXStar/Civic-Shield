import pino from 'pino';
import pc from 'picocolors';
import { sanitizePayload } from './sanitizeLogger.js';

// Base pino logger (we format mainly for console visibility as requested)
export const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info', 
});

interface LogContext {
  reqId?: string;
  user?: string;
  role?: string;
  route?: string;
  case?: string;
  [key: string]: any;
}

function formatReqId(reqId?: string) {
  return reqId ? pc.gray(`[${reqId}] `) : '';
}

function formatContextList(context: LogContext) {
  let lines = '';
  if (context.user) lines += `\n    User: ${context.user}`;
  if (context.role) lines += `\n    Role: ${context.role}`;
  if (context.route) lines += `\n    Route: ${context.route}`;
  if (context.case) lines += `\n    Case: ${context.case}`;
  
  // Add other properties naturally
  for (const [k, v] of Object.entries(context)) {
    if (!['reqId', 'user', 'role', 'route', 'case', 'message'].includes(k)) {
      if (typeof v === 'object') {
        const sanitized = sanitizePayload(v);
        lines += `\n    ${pc.dim(k)}:\n${JSON.stringify(sanitized, null, 2).split('\n').map(l => '      ' + l).join('\n')}`;
      } else {
        lines += `\n    ${pc.dim(k)}: ${v}`;
      }
    }
  }
  return lines;
}

export const logger = {
  // Base request logging
  reqEntry: (reqId: string, method: string, url: string, body?: any) => {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`${pc.gray(`[${time}]`)} ${formatReqId(reqId)}${pc.dim('→')} ${pc.cyan(method)} ${url}`);
    if (body && Object.keys(body).length > 0) {
      console.log(`Body:\n${JSON.stringify(sanitizePayload(body), null, 2)}`);
    }
  },
  
  reqExit: (reqId: string, method: string, url: string, status: number, duration: number) => {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const statusColor = status >= 500 ? pc.red(status) : status >= 400 ? pc.yellow(status) : pc.green(status);
    console.log(`${pc.gray(`[${time}]`)} ${formatReqId(reqId)}${pc.dim('←')} ${statusColor} ${pc.cyan(method)} ${url} ${pc.dim(`(${duration}ms)`)}\n`);
  },

  // Category logs
  auth: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.blue('[AUTH]')} ${message}${formatContextList(context)}`);
  },

  rbac: (message: string, context: LogContext, isDenied = false) => {
    const tag = pc.magenta('[RBAC]');
    const colorMsg = isDenied ? pc.red(message) : pc.green(message);
    console.log(`${formatReqId(context.reqId)}${tag} ${colorMsg}${formatContextList(context)}`);
  },

  db: (message: string, context: LogContext = {}) => {
    console.log(`${formatReqId(context.reqId)}${pc.yellow('[DB]')} ${message}${formatContextList(context)}`);
  },

  citizen: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.green('[CITIZEN]')} ${message}${formatContextList(context)}`);
  },

  police: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.cyan('[POLICE]')} ${message}${formatContextList(context)}`);
  },

  admin: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.red('[ADMIN]')} ${message}${formatContextList(context)}`);
  },

  evidence: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.cyan('[EVIDENCE]')} ${message}${formatContextList(context)}`);
  },

  notification: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.magenta('[NOTIFICATION]')} ${message}${formatContextList(context)}`);
  },

  validation: (message: string, context: LogContext) => {
    console.log(`${formatReqId(context.reqId)}${pc.yellow('[VALIDATION]')} ${message}${formatContextList(context)}`);
  },

  error: (message: string, context: LogContext) => {
    const errorBox = `\n${pc.red('============================================================')}
${pc.bgRed(pc.white(' SERVER ERROR '))}
${pc.red('============================================================')}
Request ID: ${context.reqId || 'N/A'}
Method: ${context.method || 'N/A'}
Route: ${context.route || 'N/A'}
User: ${context.user || 'Guest'}
Status: ${context.status || 500}
Error: ${message}
Stack: ${context.stack || 'N/A'}
${pc.red('============================================================')}\n`;
    console.error(errorBox);
  },
  
  404: (route: string, reqId?: string) => {
    console.log(`${formatReqId(reqId)}${pc.yellow('[404]')} Route not found\n    Route: ${route}`);
  },

  // Banners
  caseStatusChange: (caseId: string, prevStatus: string, newStatus: string, changedBy: string, role: string) => {
    const out = `\n${pc.cyan('============================================================')}
${pc.bgCyan(pc.black(' CASE STATUS CHANGE '))}
${pc.cyan('============================================================')}
Case: ${caseId}
Previous: ${prevStatus}
New: ${newStatus}
Changed By: ${changedBy}
Role: ${role}
${pc.cyan('============================================================')}\n`;
    console.log(out);
  },

  caseAssignment: (caseId: string, assignedToId: string, assignedByName: string) => {
    const out = `\n${pc.blue('============================================================')}
${pc.bgBlue(pc.white(' CASE ASSIGNMENT '))}
${pc.blue('============================================================')}
Case: ${caseId}
Assigned To Officer ID: ${assignedToId}
Assigned By: Admin ${assignedByName}
${pc.blue('============================================================')}\n`;
    console.log(out);
  },
  
  caseReassignment: (caseId: string, prevOfficerId: string, newOfficerId: string, changedByName: string) => {
    const out = `\n${pc.blue('============================================================')}
${pc.bgBlue(pc.white(' CASE REASSIGNMENT '))}
${pc.blue('============================================================')}
Case: ${caseId}
Previous Officer: ${prevOfficerId}
New Officer: ${newOfficerId}
Changed By: Admin ${changedByName}
${pc.blue('============================================================')}\n`;
    console.log(out);
  }
};
