const express = require("express");

const message = req => {
  return (msg, type) => {
    type = type || "info";
    let sess = req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({ type: type, string: msg });
  };
};
