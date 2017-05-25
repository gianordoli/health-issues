library(shiny)
library(stlplus)

shinyServer(function(input, output, session) {
  
  session$allowReconnect(TRUE);
  
  observe({

    input$mydata

    if (!is.null(input$mydata)) {
      # print(input$mydata)
      
      ul <- unlist(strsplit(input$mydata,","))
      data <- matrix(ul, length(input$mydata), 2, T)

      # Retrieving first and last months and weeks
      firstDateRow <- head(data[,c(1)], n=1)
      firstDate <- strsplit(toString(firstDateRow), "-")
      firstYear <- as.integer(firstDate[[1]][1])
      firstMonth <- as.integer(firstDate[[1]][2])
      lastDateRow <- tail(data[,c(1)], n=1)
      lastDate <- strsplit(toString(lastDateRow), "-")
      lastYear <- as.integer(lastDate[[1]][1])
      lastMonth <- as.integer(lastDate[[1]][2])
      
      values <-data[,c(2)]      
      
      # Convert data to time series; using only second column (values)
      myTS <- ts(values, start=c(firstYear, firstMonth), end=c(lastYear, lastMonth), frequency=12)

      # Run stl script
      mySTL <- stl(myTS, t.window = NULL, s.window="periodic", robust=TRUE)
      # print(mySTL$time.series)
      
      # Convert to data frame
      mySTL.DF <- as.data.frame(mySTL$time.series)
      # print(mySTL.DF$seasonal)
      
      response <- paste('seasonal:', toString(mySTL.DF$seasonal), 'trend:', toString(mySTL.DF$trend))
      # print(response)
      
      session$sendCustomMessage(type = "myCallbackHandler", response)
    }
  })

  
})

