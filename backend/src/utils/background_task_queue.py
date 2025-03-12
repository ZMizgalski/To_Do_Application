import threading
import queue


class BackgroundTaskQueue:
    def __init__(self, num_workers=4):
        self.task_queue = queue.Queue()
        self.workers = []
        self.running = True
        
        for _ in range(num_workers):
            worker = threading.Thread(target=self._worker_loop)
            worker.daemon = True
            worker.start()
            self.workers.append(worker)

    def _worker_loop(self):
        while self.running:
            try:
                task, args, kwargs = self.task_queue.get(timeout=0.5)
                try:
                    task(*args, **kwargs)
                except Exception as e:
                    print(f"Task error: {e}")
                finally:
                    self.task_queue.task_done()
            except queue.Empty:
                continue
    
    def add_task(self, task, *args, **kwargs):
        self.task_queue.put((task, args, kwargs))
    
    def wait_for_completion(self):
        self.task_queue.join()
    
    def stop(self):
        self.running = False

        for worker in self.workers:
            worker.join()

        self.workers = []

taskQueue = BackgroundTaskQueue(num_workers=6)
