var Address = function(address) {
    address = address || {};
    this.street = address.street || '          ';
    this.city = address.city || '          ';
    this.state = address.state || '  ';
    this.zip = address.zip || '     ';
    this.hideStreet = address.hideStreet || false;
};


module.exports = Address;
