
<div className="chart-vistior">
      
        
        
<Row gutter>
  {items.map((v, index) => (
    <Col xs={6} xl={6} sm={6} md={6} key={index}>
      <div className="chart-visitor-count">
        <Title level={4}>{v.Title}</Title>
        <span>{v.user}</span>
      </div>
    </Col>
  ))}
</Row>
</div>