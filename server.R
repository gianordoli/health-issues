library(shiny)

shinyServer(function(input, output, session) {
  
  observe({
    session$sendCustomMessage(type = "myCallbackHandler", input$mydata)
  })  

  
})