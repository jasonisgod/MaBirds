import signal

class CtrlBreakInterrupt(BaseException):
    pass

def handler(*args):
    raise CtrlBreakInterrupt

signal.signal(signal.SIGBREAK, handler)
