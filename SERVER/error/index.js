
process.on('uncaughtException',(err) => {
  console.error('未捕获的异常:',err);
  // 记录日志或发送告警，但不要直接退出进程
});
process.on('unhandledRejection',(reason,promise) => {
  console.error('未处理的 Promise rejection:',reason);
  // 记录日志或发送告警
});
