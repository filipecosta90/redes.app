#!/usr/bin/perl  
use strict;
use warnings;

use Data::Dumper;
use JSON;
use CGI;
use CGI::Carp 'fatalsToBrowser';
use Net::SNMP qw(:snmp);
use DB;

my $query = CGI->new;

my %data;
my %errors;
my @response;

my $ip_address='127.0.0.1';
my $snmp_key='public';
my @snmp_oids='1.3.6.1.2.1.4.3';
my $snmp_mib_time='SNMPv2-MIB::sysUpTime.0';

my $session;
my $error;

($session, $error) = Net::SNMP->session(
		-hostname => $ip_address,
		-version => 'snmpv2c',
		-community => $snmp_key
		);

if (!defined $session) {
	$data{'success'} = 'false';
	$errors{'session'} = 'Unable to define Net::SNMP session.';
	$data{'errors'} = \%errors;
	$data{'messageError'} = 'Please check the fields in red';
	my $json_response = encode_json( { %data } );
	print $query->header("application/json");
	print $json_response;



}
else{
	my @args;	
	push(@args, -varbindlist => \@snmp_oids);
	push(@args, -maxrepetitions => scalar @snmp_oids); 
	my @response = $session->get_bulk_request(@args);


outer: while (defined($session->get_bulk_request(@args))) {

	       my @oids = oid_lex_sort(keys(%{$session->var_bind_list()}));

	       foreach (@oids) {

		       printf(
				       "%s = %s: %s\n", $_, 
				       snmp_type_ntop($session->var_bind_types()->{$_}),
				       $session->var_bind_list()->{$_},
			     );

# Make sure we have not hit the end of the MIB
		       if ($session->var_bind_list()->{$_} eq 'endOfMibView') { last outer; } 
	       }

# Get the last OBJECT IDENTIFIER in the returned list
	       @args = (-maxrepetitions => 25, -varbindlist => [pop(@oids)]);
       }

}

#		$response = $session->get_bulk_request (
#				-nonrepeaters => '1',
#				-maxrepetitions => scalar @snmp_oids,
#				-varbindlist     => \@snmp_oids
#				);
#		$session->close();
#		my $json_response = encode_json( { $response } );
#		print $query->header("application/json");
