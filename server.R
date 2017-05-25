library(shiny)
library(stlplus)

shinyServer(function(input, output, session) {
  
  session$allowReconnect(TRUE);
  
  observe({
    input$seasonalData
    if (!is.null(input$seasonalData)) {
      print(input$seasonalData)
      myTS <- vectorToTS(input$seasonalData)
      mySTL <- stl(myTS, t.window = NULL, s.window="periodic", robust=TRUE)
      mySTL.DF <- as.data.frame(mySTL$time.series)
      response <- toString(mySTL.DF$seasonal)
      session$sendCustomMessage(type = "seasonalCallBack", response)
    }
  })
  
  observe({
    input$trendData
    if (!is.null(input$trendData)) {
      print(input$trendData)
      myTS <- vectorToTS(input$trendData)
      mySTL <- stl(myTS, t.window = NULL, s.window="periodic", robust=TRUE)
      mySTL.DF <- as.data.frame(mySTL$time.series)
      response <- toString(mySTL.DF$trend)
      session$sendCustomMessage(type = "trendCallBack", response)
    }
  })
  
})

vectorToTS < function(data) {
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
  
  return(myTS)
}