export function useKeyboard() {
  const taskStore = useTaskStore();

  function isFullscreen() {
    return taskStore.art?.fullscreen || taskStore.art?.fullscreenWeb;
  }

  function onKeyDown(event) {
    const code = getKeyCode(event);

    switch (code) {
      case 'Space':
        event.preventDefault();
        taskStore.art.toggle();
        break;
      case 'KeyZ':
        event.preventDefault();
        if (event.metaKey && event.shiftKey) {
          if (taskStore.canRedo) {
            taskStore.redo();
          }
        } else if (event.metaKey) {
          if (taskStore.canUndo) {
            taskStore.undo();
          }
        }
        break;
      case 'ArrowUp': {
        event.preventDefault();
        if (isFullscreen()) {
          taskStore.art.volume += 0.1;
        } else {
          if (taskStore.currentIndex === -1 && taskStore.task.subtitle.length) {
            for (
              let index = 0;
              index < taskStore.task.subtitle.length;
              index++
            ) {
              const prve = taskStore.task.subtitle[index - 1];
              const next = taskStore.task.subtitle[index];
              if (
                taskStore.currentTime > prve?.endTime &&
                taskStore.currentTime < next?.startTime
              ) {
                taskStore.art.seek = prve.startTime + 0.01;
                return;
              }
            }
            taskStore.art.seek = taskStore.task.subtitle[0].startTime + 0.01;
          } else {
            const sub = taskStore.task.subtitle[taskStore.currentIndex - 1];
            if (sub) {
              taskStore.art.seek = sub.startTime + 0.01;
            }
          }
        }

        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        if (isFullscreen()) {
          taskStore.art.volume -= 0.1;
        } else {
          if (taskStore.currentIndex === -1 && taskStore.task.subtitle.length) {
            for (
              let index = 0;
              index < taskStore.task.subtitle.length;
              index++
            ) {
              const prve = taskStore.task.subtitle[index - 1];
              const next = taskStore.task.subtitle[index];
              if (
                taskStore.currentTime > prve?.endTime &&
                taskStore.currentTime < next?.startTime
              ) {
                taskStore.art.seek = next.startTime + 0.01;
                return;
              }
            }
            taskStore.art.seek = taskStore.task.subtitle[0].startTime + 0.01;
          } else {
            const sub = taskStore.task.subtitle[taskStore.currentIndex + 1];
            if (sub) {
              taskStore.art.seek = sub.startTime + 0.01;
            }
          }
        }

        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (isFullscreen()) {
          taskStore.art.backward = 5;
        } else {
          const sub = taskStore.task.subtitle[taskStore.currentIndex];
          if (sub) {
            const startTime = t2d(sub.start) - 0.1;
            sub.start = d2t(startTime);
            sub.end = d2t(t2d(sub.end) - 0.1);
            taskStore.art.seek = startTime + 0.01;
          }
        }

        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (isFullscreen()) {
          taskStore.art.forward = 5;
        } else {
          const sub = taskStore.task.subtitle[taskStore.currentIndex];
          if (sub) {
            const startTime = t2d(sub.start) + 0.1;
            sub.start = d2t(startTime);
            sub.end = d2t(t2d(sub.end) + 0.1);
            taskStore.art.seek = startTime + 0.01;
          }
        }
        break;
      }
      case 'Backspace':
      case 'Delete': {
        event.preventDefault();
        const sub = taskStore.task.subtitle[taskStore.currentIndex];
        if (sub) {
          taskStore.task.subtitle.splice(taskStore.currentIndex, 1);
        }
        break;
      }
      case 'Escape':
        if (taskStore.art.fullscreenWeb) {
          taskStore.art.fullscreenWeb = false;
        }
        break;
      default:
        break;
    }
  }

  useEventListener(document, 'keydown', onKeyDown);
}
