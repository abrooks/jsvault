#!/usr/bin/python
import os
import sys
import re

print "Content-type: text/plain\n\n"
sys.stderr = sys.stdout
pathparts = re.match("/(\w+)/(.*)", os.environ['PATH_INFO'])
if not pathparts:
  print "Invalid server parameters"
else:
  cmd, argstr = pathparts.groups()
  if cmd == "replace":
    if not re.match("\w+-\w+\.txt$", argstr):
      print "Invalid database name"
    else:
      if not os.path.exists("db/" + argstr):
        print "No existing db", argstr, "to replace"
      else:
        db = open("db/" + argstr, "w")
        db.write(sys.stdin.read())
        db.close()
        print "OK"
  elif cmd == "create":
    if not re.match("\w+-\w+\.txt$", argstr):
      print "Invalid database name"
    else:
      if os.path.exists("db/" + argstr):
        print "You already have a db with that password"
      else:
        db = open("db/" + argstr, "w")
        db.write(sys.stdin.read())
        db.close()
        print "OK"

sys.stdout.flush()
