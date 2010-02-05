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
    createargs = re.match("(\w+)-\w+\.txt$", argstr)
    if not createargs:
      print "Invalid database name"
    else:
      if os.path.exists("db/" + argstr):
        print "You already have a db with that password"
      else:
        user = createargs.group(1)
        dupuser = False
        for file in os.listdir('db'):
          if file.startswith(user):
            dupuser = True
            break
        if dupuser:
          print "That username already exists. Please try again."
        else:
          db = open("db/" + argstr, "w")
          db.write(sys.stdin.read())
          db.close()
          print "OK"

sys.stdout.flush()
