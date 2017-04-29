library(shiny)
library(fpp2)

shinyServer(function(input, output, session) {
  
  observe({

    # data <- input$mydata    
    #   
    # # Retrieving first and last months and weeks
    # firstDateRow <- head(data[,c(1)], n=1)
    # firstDate <- strsplit(toString(firstDateRow), "-")
    # firstYear <- as.integer(firstDate[[1]][1])
    # firstMonth <- as.integer(firstDate[[1]][2])
    #   
    # lastDateRow <- tail(data[,c(1)], n=1)
    # lastDate <- strsplit(toString(lastDateRow), "-")
    # lastYear <- as.integer(lastDate[[1]][1])
    # lastMonth <- as.integer(lastDate[[1]][2])
    #   
    # values <-data[,c(2)]
    
    session$sendCustomMessage(type = "myCallbackHandler", input$mydata)
      
    # if (values.length > 0) {
    
      # Convert data to time series; using only second column (values)
      # myTS <- ts(values, start=c(firstYear, firstMonth), end=c(lastYear, lastMonth), frequency=12)
      # 
      # # Run stl script
      # mySTL <- stl(myTS, t.window=15, s.window="periodic", robust=TRUE)
      # 
      # # Convert to data frame
      # mySTL.DF <- as.data.frame(mySTL$time.series)
      # 
      # mySTL$time.series
      # 
      # 
      # session$sendCustomMessage(type = "myCallbackHandler", data)
    # }
    
  })

  
})

